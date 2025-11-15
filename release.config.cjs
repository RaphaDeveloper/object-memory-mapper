/** @type {import('semantic-release').GlobalConfig} */
module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",      // decides version bump (patch/minor/major)
    "@semantic-release/release-notes-generator", // generates release notes from commits
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: true
      }
    ],
    "@semantic-release/github", // creates GitHub Releases
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]"
      }
    ]
  ]
};
