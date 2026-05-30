#!/usr/bin/env bash
#
# Send a test email to the local dev server's email handler.
#
# The dev server (`bun run dev`) exposes Cloudflare's local email endpoint at
# /cdn-cgi/handler/email. This POSTs a raw RFC 822 message to it so you can
# exercise the `email()` handler in src/worker.tsx.
#
# Usage:
#   ./scripts/send-test-email.sh "Your email body goes here"
#
# Env overrides: HOST (default http://localhost:5173)

set -euo pipefail

HOST="${HOST:-http://localhost:5173}"
FROM="sender@example.com"
TO="recipient@example.com"
SUBJECT="Testing Email Workers Local Dev"
BODY="${1:-Hi there}"

DATE="$(date -u '+%a, %d %b %Y %H:%M:%S +0000')"
MESSAGE_ID="<$(date +%s)$(printf '%04d' $((RANDOM % 10000)))@mydevlist-test>"

# Raw RFC 822 message. The blank line separates headers from the body.
RAW="Received: from smtp.example.com (127.0.0.1)
        by cloudflare-email.com (unknown) id 4fwwffRXOpyR
        for <${TO}>; ${DATE}
From: <${FROM}>
Reply-To: ${FROM}
To: ${TO}
Subject: ${SUBJECT}
Content-Type: text/html; charset=\"windows-1252\"
X-Mailer: Curl
Date: ${DATE}
Message-ID: ${MESSAGE_ID}

${BODY}"

echo "POST ${HOST}/cdn-cgi/handler/email  (${FROM} -> ${TO})"

curl --silent --show-error --fail-with-body \
  --request POST "${HOST}/cdn-cgi/handler/email" \
  --url-query "from=${FROM}" \
  --url-query "to=${TO}" \
  --header 'Content-Type: application/json' \
  --data-raw "${RAW}"

echo
echo "Sent. Check the dev server logs for the parsed email output."
