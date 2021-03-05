#![no_std]

extern crate alloc;

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

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_bytes(b: &[u8]);
}

use miniz_oxide::{deflate, inflate};

#[wasm_bindgen(start)]
pub fn main() {
    log("Starting worker!");

    let worker = js_sys::global().unchecked_into::<web_sys::DedicatedWorkerGlobalScope>();

    let ws = web_sys::WebSocket::new("wss://lantern.chat/api/v1/gateway");

    let value = "Hello, World!";

    let res = deflate::compress_to_vec(value.as_bytes(), 9);

    log_bytes(&res);

    match inflate::decompress_to_vec(&res) {
        Ok(bytes) => log_bytes(&bytes),
        Err(_err) => log("Error decompressing"),
    }

    //let compressed = flate2::

    //log(&format!("{:?}", res));
}
