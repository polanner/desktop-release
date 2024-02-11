const fs = require("node:fs");
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/core");
const semver = require("semver");

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

async function updateLatest() {
    const content = {};
    const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/releases",
        {
            owner: "polanner",
            repo: "release-desktop",
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        }
    );

    var latest = data
        .map((release) => release.tag_name)
        .sort(semver.rcompare)[0];

    content.version = latest;
    content.platforms = {};

    const osList = ["linux", "darwin", "windows"];
    const archList = ["x86_64", "aarch64", "i686", "armv7"];

    await Promise.all(
        osList.map(async (os) => {
            await Promise.all(
                archList.map(async (arch) => {
                    content.platforms[`${os}-${arch}`] = {
                        signature: await getSignature(os),
                        url: getUrl(os),
                    };
                })
            );
        })
    );

    fs.writeFileSync("./latest.json", JSON.stringify(content));
}

function getUrl(os) {
    const baseUrl =
        "https://github.com/polanner/release-desktop/releases/latest/download";
    switch (os) {
        case "darwin":
            return `${baseUrl}/polanner-desktop_x64.app.tar.gz`;
        case "linux":
            return `${baseUrl}/polanner-desktop_1.1.0_amd64.AppImage.tar.gz`;
        case "windows":
            return `${baseUrl}/polanner-desktop_1.1.0_x64_en-US.msi.zip`;
    }
}

async function getSignature(os) {
    var res = await fetch(`${getUrl(os)}.sig`);
    return await res.text();
}

updateLatest();
