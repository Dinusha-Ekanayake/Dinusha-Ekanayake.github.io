#!/usr/bin/env bash
# Refreshes stats.json with public + private repository and commit totals.
#
# Runs on YOUR machine using your existing `gh auth login` session, so no
# access token is ever stored in this repository, in GitHub secrets, or in the
# public website. Only four aggregate numbers are written to stats.json.
#
# Usage:  bash scripts/update-stats.sh   (then commit and push stats.json)
set -euo pipefail

login=$(gh api user --jq .login)
commits=$(gh api "search/commits?q=author%3A${login}&per_page=1" --jq .total_count)
read -r repos public private < <(gh api graphql \
  -f query='{viewer{all:repositories(ownerAffiliations:OWNER){totalCount} pub:repositories(privacy:PUBLIC,ownerAffiliations:OWNER){totalCount} priv:repositories(privacy:PRIVATE,ownerAffiliations:OWNER){totalCount}}}' \
  --jq '.data.viewer|"\(.all.totalCount) \(.pub.totalCount) \(.priv.totalCount)"')

case "${commits}${repos}${public}${private}" in
  ""|*[!0-9]*) echo "Unexpected GitHub response; stats.json left unchanged." >&2; exit 1;;
esac

printf '{"commits":%s,"repos":%s,"publicRepos":%s,"privateRepos":%s,"updatedAt":%s}\n' \
  "$commits" "$repos" "$public" "$private" "$(( $(date +%s) * 1000 ))" > stats.json
cat stats.json
