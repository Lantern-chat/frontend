#![no_std]
#![allow(unused)]

extern crate alloc;
use alloc::boxed::Box;
use alloc::vec::Vec;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = error)]
    fn err(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_bytes(b: &[u8]);
}

use js_sys::{ArrayBuffer, Uint8Array};

use miniz_oxide::{deflate, inflate};

#[wasm_bindgen]
pub struct Compressor {
    decomp: Box<inflate::core::DecompressorOxide>,
    comp: Box<deflate::core::CompressorOxide>,
    buf: Vec<u8>,
    out: Vec<u8>,
}

use deflate::core::{TDEFLFlush, TDEFLStatus};
use inflate::TINFLStatus;

#[wasm_bindgen]
impl Compressor {
    pub fn create() -> Self {
        Compressor {
            decomp: Box::default(),
            comp: {
                let mut comp = Box::<deflate::core::CompressorOxide>::default();
                comp.set_compression_level_raw(6);
                comp
            },
            buf: Vec::new(),
            out: Vec::new(),
        }
    }

    fn decompress_inplace(&mut self) -> Result<(), TINFLStatus> {
        let flags = inflate::core::inflate_flags::TINFL_FLAG_USING_NON_WRAPPING_OUTPUT_BUF
            | inflate::core::inflate_flags::TINFL_FLAG_PARSE_ZLIB_HEADER;

        self.out.resize(self.buf.len().saturating_mul(2), 0);

        self.decomp.init();

        let mut in_pos = 0;
        let mut out_pos = 0;

        loop {
            let (status, in_consumed, out_consumed) = inflate::core::decompress(
                &mut self.decomp,
                &self.buf[in_pos..],
                &mut self.out,
                out_pos,
                flags,
            );

            in_pos += in_consumed;
            out_pos += out_consumed;

            match status {
                TINFLStatus::Done => {
                    self.out.truncate(out_pos);
                    return Ok(());
                }
                TINFLStatus::HasMoreOutput => {
                    // We need more space, so check if we can resize the buffer and do it.
                    let new_len = self
                        .out
                        .len()
                        .checked_add(out_pos)
                        .ok_or(TINFLStatus::HasMoreOutput)?;

                    self.out.resize(new_len, 0);
                }
                _ => return Err(status),
            }
        }
    }

    pub fn decompress(&mut self, abuf: ArrayBuffer) -> Result<Uint8Array, JsValue> {
        // copy message into memory, reusing the buffer
        let array = Uint8Array::new(&abuf);
        self.buf.resize(array.length() as usize, 0);
        array.copy_to(&mut self.buf);

        match self.decompress_inplace() {
            Ok(()) => Ok(unsafe { Uint8Array::view(&self.out) }),
            Err(_) => Err(JsValue::from("Error Decompressing")),
        }
    }

    fn compress_inplace(&mut self) -> Result<(), TDEFLStatus> {
        self.out.resize((self.buf.len() / 2).max(2), 0);

        let mut in_pos = 0;
        let mut out_pos = 0;

        loop {
            let (status, bytes_in, bytes_out) = deflate::core::compress(
                &mut self.comp,
                &self.buf[in_pos..],
                &mut self.out[out_pos..],
                TDEFLFlush::Finish,
            );

            out_pos += bytes_out;
            in_pos += bytes_in;

            match status {
                TDEFLStatus::Done => {
                    self.out.truncate(out_pos);
                    return Ok(());
                }
                TDEFLStatus::Okay => {
                    // We need more space, so resize the vector.
                    if self.out.len().saturating_sub(out_pos) < 30 {
                        self.out.resize(self.out.len() * 2, 0)
                    }
                }
                _ => return Err(status),
            }
        }
    }

    pub fn compress(&mut self, array: Uint8Array) -> Result<Uint8Array, JsValue> {
        self.buf.resize(array.length() as usize, 0);
        array.copy_to(&mut self.buf);

        match self.compress_inplace() {
            Ok(()) => Ok(unsafe { Uint8Array::view(&self.out) }),
            Err(_) => Err(JsValue::from("Error Compressing")),
        }
    }
}
