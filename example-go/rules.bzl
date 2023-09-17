# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under both the MIT license found in the
# LICENSE-MIT file in the root directory of this source tree and the Apache
# License, Version 2.0 found in the LICENSE-APACHE file in the root directory
# of this source tree.

load("@toolchains//:go_toolchain.bzl", "GoCompilerInfo")

def _go_binary_impl(ctx: AnalysisContext) -> list[Provider]:
    sources = ctx.attrs.srcs
    extension = ".exe" if host_info().os.is_windows else ""
    out = ctx.actions.declare_output("main" + extension)

    cmd = cmd_args([ctx.attrs.toolchain[GoCompilerInfo].compiler_path, "build", "-o", out.as_output()] + sources)

    ctx.actions.run(cmd, category = "compile")

    return [
        DefaultInfo(default_output = out),
        RunInfo(args = cmd_args(out)),
    ]

go_binary = rule(
    impl = _go_binary_impl,
    attrs = {
        "deps": attrs.list(attrs.dep()),
        "srcs": attrs.list(attrs.source()),
        "toolchain": attrs.dep(),
    },
)
