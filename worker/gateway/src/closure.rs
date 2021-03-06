use alloc::boxed::Box;

#[inline(always)]
pub fn __cb<E, U, F>(f: F) -> Box<dyn FnMut(E) -> U>
where
    F: FnMut(E) -> U + 'static,
{
    Box::new(f) as Box<dyn FnMut(E) -> U>
}

macro_rules! closure {
    ($func:expr) => {
        wasm_bindgen::closure::Closure::wrap($crate::closure::__cb($func))
    };
}
