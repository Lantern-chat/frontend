#![no_std]
#![allow(unused)]

extern crate alloc;
use alloc::boxed::Box;
use alloc::string::String;
use alloc::vec::Vec;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[macro_use]
extern crate serde;

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

use js_sys::{JsString, Uint8Array};
use web_sys::{ErrorEvent, MessageEvent, WebSocket};

use miniz_oxide::{deflate, inflate};

#[macro_use]
pub mod closure;

#[derive(Serialize, Deserialize)]
pub struct Message {
    pub code: u32,
    pub msg: String,
}

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    log("Starting worker!");

    let worker = js_sys::global().dyn_into::<web_sys::DedicatedWorkerGlobalScope>()?;

    let ws = web_sys::WebSocket::new("wss://lantern.chat/api/v1/gateway")?;
    ws.set_binary_type(web_sys::BinaryType::Arraybuffer);

    let mut recv_buffer = Vec::new();
    let encoder = web_sys::TextEncoder::new()?;
    let decoder = web_sys::TextDecoder::new()?;

    let w = worker.clone();
    let on_message = closure!(move |e: MessageEvent| {
        if let Ok(abuf) = e.data().dyn_into::<js_sys::ArrayBuffer>() {
            // get compressed message into memory
            let array = js_sys::Uint8Array::new(&abuf);
            recv_buffer.resize(array.length() as usize, 0);
            array.copy_to(&mut recv_buffer);

            // decompress
            let mut encoded_msg = match inflate::decompress_to_vec(&recv_buffer) {
                Err(_e) => return err("Error decompressing message"),
                Ok(encoded_msg) => encoded_msg,
            };

            // decode UTF8 to UTF16 for JS
            let msg = match decoder.decode_with_u8_array(&mut encoded_msg) {
                Err(_e) => return err("Error decoding message"),
                Ok(msg) => msg,
            };

            // create message object to send to UI thread
            let value = match serde_wasm_bindgen::to_value(&Message { code: 0, msg }) {
                Err(_e) => return err("Error serializing message"),
                Ok(value) => value,
            };

            // post message
            if let Err(e) = w.post_message(&value) {
                err("Error posting message");
            }
        } else {
            err("Unexpected websocket data type");
        }
    });
    ws.set_onmessage(Some(on_message.as_ref().unchecked_ref()));
    on_message.forget();

    Ok(())
}
