const { Octokit } = require("@octokit/core");
const semver = require("semver");

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

async function bootstrap() {
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

    console.log(data[0]);
}

bootstrap();
