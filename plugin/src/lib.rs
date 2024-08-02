use extism_pdk::*;
use fluentci_pdk::dag;

pub mod helpers;
use helpers::setup_buck2;

#[plugin_fn]
pub fn setup(version: String) -> FnResult<String> {
    let stdout = setup_buck2(version)?;
    Ok(stdout)
}

#[plugin_fn]
pub fn test(args: String) -> FnResult<String> {
    setup_buck2("latest".into())?;
    let stdout = dag()
        .pipeline("test")?
        .pkgx()?
        .with_exec(vec!["buck2", "test", &args])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn build(args: String) -> FnResult<String> {
    setup_buck2("latest".into())?;
    let stdout = dag()
        .pipeline("build")?
        .with_exec(vec!["buck2", "build", &args])?
        .stdout()?;
    Ok(stdout)
}
