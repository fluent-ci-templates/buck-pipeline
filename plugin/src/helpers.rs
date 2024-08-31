use anyhow::Error;
use fluentci_pdk::dag;

pub fn setup_buck2(version: String) -> Result<String, Error> {
    let update = dag().get_env("UPDATE_BUCK2")?;
    match version.is_empty() {
        true => dag().set_envs(vec![("BUCK2_VERSION".into(), "latest".into())])?,
        false => dag().set_envs(vec![("BUCK2_VERSION".into(), version)])?,
    };

    let os = dag().get_os()?;
    match os.as_str() {
        "macos" => dag().set_envs(vec![("OS".into(), "apple-darwin".into())])?,
        _ => dag().set_envs(vec![("OS".into(), "unknown-linux-gnu".into())])?,
    };

    let arch = dag().get_arch()?;
    dag().set_envs(vec![("ARCH".into(), arch)])?;

    let path = dag().get_env("PATH")?;
    let home = dag().get_env("HOME")?;

    dag().set_envs(vec![(
        "PATH".into(),
        format!("{}/.local/bin:{}", home, path),
    )])?;

    if !update.is_empty() {
        let stdout = dag().pkgx()?.with_exec(vec!["pkgx wget https://github.com/facebook/buck2/releases/download/${BUCK2_VERSION}/buck2-${ARCH}-${OS}.zst"])?
      .with_exec(vec!["pkgx unzstd buck2-${ARCH}-${OS}.zst"])?
      .with_exec(vec!["chmod +x buck2-${ARCH}-${OS}"])?
      .with_exec(vec!["cp buck2-${ARCH}-${OS} $HOME/.local/bin/buck2"])?
      .with_exec(vec!["rm -rf buck2-*"])?
      .stdout()?;
        return Ok(stdout);
    }

    let stdout = dag().pkgx()?.with_exec(vec!["type buck2 > /dev/null 2> /dev/null || pkgx wget https://github.com/facebook/buck2/releases/download/${BUCK2_VERSION}/buck2-${ARCH}-${OS}.zst"])?
      .with_exec(vec!["type buck2 > /dev/null 2> /dev/null || pkgx unzstd buck2-${ARCH}-${OS}.zst"])?
      .with_exec(vec!["type buck2 > /dev/null 2> /dev/null || chmod +x buck2-${ARCH}-${OS}"])?
      .with_exec(vec!["type buck2 > /dev/null 2> /dev/null || mv buck2-${ARCH}-${OS} $HOME/.local/bin/buck2"])?
      .with_exec(vec!["rm -rf buck2-*"])?
  .stdout()?;

    dag()
        .pkgx()?
        .with_exec(vec!["pkgx git submodule update --init --recursive"])?
        .with_exec(vec!["pkgx git submodule update --recursive --remote"])?
        .stdout()?;

    Ok(stdout)
}
