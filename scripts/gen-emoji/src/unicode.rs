//! Fetch and parse raw emoji data from Unicode.org.

use std::iter;
use std::path::Path;
use std::str;

use anyhow::{bail, Context, Result};
use heck::CamelCase;
use indexmap::IndexMap;
use itertools::Itertools;

const SKIN_TONES: &[char] = &[
    '\u{1f3fb}', // light skin tone
    '\u{1f3fc}', // medium-light skin tone
    '\u{1f3fd}', // medium skin tone
    '\u{1f3fe}', // medium-dark skin tone
    '\u{1f3ff}', // dark skin tone
];

#[derive(Debug)]
pub enum Status {
    FullyQualified,
    MinimallyQualified,
    Unqualified,
    Component,
}

#[derive(Debug)]
pub struct Emoji {
    pub chars: Vec<char>,
    pub status: Status,
    pub name: String,
    pub variations: Vec<String>,
    pub skin_tones: Vec<String>,
}

pub type ParsedData = IndexMap<String, IndexMap<String, Vec<Emoji>>>;

type Lines<'a> = iter::Peekable<str::Lines<'a>>;

trait LinesExt {
    fn consume_until_starts_with(&mut self, prefix: &str, stop: Option<&str>) -> Option<String>;

    fn next_group(&mut self) -> Option<String> {
        self.consume_until_starts_with("# group: ", None)
    }

    fn next_subgroup(&mut self) -> Option<String> {
        self.consume_until_starts_with("# subgroup: ", Some("# group: "))
    }
}

impl LinesExt for Lines<'_> {
    fn consume_until_starts_with(&mut self, prefix: &str, stop: Option<&str>) -> Option<String> {
        loop {
            match self.peek() {
                Some(line) => {
                    if let Some(prefix) = stop {
                        if line.starts_with(prefix) {
                            return None;
                        }
                    }
                    if line.starts_with(prefix) {
                        let name = line.strip_prefix(prefix).unwrap().to_owned();
                        self.next();
                        return Some(name);
                    }
                    self.next();
                }
                None => return None,
            }
        }
    }
}

fn parse_code_point(code_point: &str) -> Result<char> {
    let scalar = u32::from_str_radix(code_point, 16).context("not hex")?;
    std::char::from_u32(scalar).context("not Unicode scalar value")
}

impl Emoji {
    fn from_line(line: &str) -> Result<Self> {
        let (code_points, rest) = line.splitn(2, ';').next_tuple().context("expected code points")?;
        let (status, rest) = rest.splitn(2, '#').next_tuple().context("expected status")?;
        let name = rest.trim().splitn(3, ' ').nth(2).context("expected name")?;

        let chars = code_points
            .trim()
            .split(' ')
            .map(parse_code_point)
            .collect::<Result<Vec<_>>>()?;
        let status = match status.trim() {
            "fully-qualified" => Status::FullyQualified,
            "minimally-qualified" => Status::MinimallyQualified,
            "unqualified" => Status::Unqualified,
            "component" => Status::Component,
            s => bail!("unrecognized status `{}`", s),
        };
        let name = name.trim().to_owned();

        Ok(Self {
            chars,
            status,
            name,
            variations: Vec::new(),
            skin_tones: Vec::new(),
        })
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn emoji(&self) -> String {
        self.chars.iter().collect()
    }

    pub fn variations(&self) -> &[String] {
        &self.variations
    }

    pub fn skin_tones(&self) -> &[String] {
        &self.skin_tones
    }
}

fn parse_emoji_data(data: &str) -> Result<ParsedData> {
    let mut parsed_data = ParsedData::default();

    let mut lines = data.lines().peekable();
    while let Some(group) = lines.next_group() {
        while let Some(subgroup) = lines.next_subgroup() {
            for line in &mut lines {
                if line.is_empty() {
                    break;
                }
                let emoji = Emoji::from_line(line)?;
                let group = group.replace("&", "And").to_camel_case();

                if matches!(emoji.status, Status::Component) {
                    continue;
                } else if matches!(emoji.status, Status::MinimallyQualified | Status::Unqualified) {
                    parsed_data[&group][&subgroup]
                        .iter_mut()
                        .last()
                        .with_context(|| {
                            format!("failed to find fully qualified variation for `{}`", emoji.name())
                        })?
                        .variations
                        .push(emoji.emoji());
                } else if SKIN_TONES.iter().any(|c| emoji.chars.contains(c)) {
                    parsed_data[&group][&subgroup]
                        .iter_mut()
                        .last()
                        .with_context(|| {
                            format!(
                                "failed to find default skin tone variation for `{}`",
                                emoji.name()
                            )
                        })?
                        .skin_tones
                        .push(emoji.emoji());
                } else {
                    parsed_data
                        .entry(group)
                        .or_default()
                        .entry(subgroup.clone())
                        .or_insert_with(Vec::new)
                        .push(emoji);
                }
            }
        }
    }

    Ok(parsed_data)
}

pub fn fetch_and_parse_emoji_data(path: impl AsRef<Path>) -> Result<ParsedData> {
    let data = std::fs::read_to_string(path)?;
    let parsed_data = parse_emoji_data(&data)?;
    Ok(parsed_data)
}
