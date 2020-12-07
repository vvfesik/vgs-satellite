# shellcheck disable=SC2046
tag=${CIRCLE_TAG}
last_release=$(curl -s https://api.github.com/repos/verygoodsecurity/vgs-satellite/releases -H "Authorization: token ${GITHUB_TOKEN}" | jq --arg tag "$tag" '[.[]|select(.tag_name==$tag)][0]')
release_url=$(eval echo $(echo $last_release | jq '.html_url'))
author=$(eval echo $(echo $last_release | jq '.author.login'))
author_url=$(eval echo $(echo $last_release | jq '.author.html_url'))
is_draft=$(eval echo $(echo $last_release | jq '.draft'))
body=$(eval echo $(echo $last_release | jq '.body'))
linux_asset=$(echo $last_release | jq '[.assets|.[]|select(.name|test(".AppImage"))][0]')
mac_asset=$(echo $last_release | jq '[.assets|.[]|select(.name|test(".dmg"))][0]')
linux_name=$(eval echo $(echo $linux_asset | jq '.name'))
linux_url=$(eval echo $(echo $linux_asset | jq '.browser_download_url'))
mac_name=$(eval echo $(echo $mac_asset | jq '.name'))
mac_url=$(eval echo $(echo $mac_asset | jq '.browser_download_url'))

[[ $body = "" ]] &&
  body_text="<empty>" ||
  body_text=body

[[ $is_draft = "true" ]] &&
  pretext="New <$release_url|release draft> was created" ||
  pretext="New <$release_url|release> was published"

curl --data-urlencode \
  "payload={\"attachments\": [{\"fallback\":\"$pretext\", \"pretext\":\"$pretext\", \"color\":\"#40E0D0\", \"fields\":[{\"title\":\"Version\", \"value\":\"$tag\"}, {\"title\":\"Author\", \"value\":\"<$author_url|$author>\"}, {\"title\":\"macOS asset\", \"value\":\"<$mac_url|$mac_name>\"}, {\"title\":\"Linux asset\", \"value\":\"<$linux_url|$linux_name>\"}, {\"title\":\"Release body\", \"value\":\"$body_text\"}]}]}" \
  ${SLACK_URL}
