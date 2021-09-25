#![allow(unused)]

use indexmap::IndexMap;
use unicode::Emoji;

pub mod unicode;

fn main() -> anyhow::Result<()> {
    let data = unicode::fetch_and_parse_emoji_data("./emoji-test.txt")?;

    println!("{:#?}", data);

    Ok(())
}
