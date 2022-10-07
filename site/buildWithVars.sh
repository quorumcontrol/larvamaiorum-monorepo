#!/usr/bin/env bash

# This makes the netlify CONTEXT available to the front-end
NEXT_PUBLIC_CONTEXT=${CONTEXT};
echo "Build Context: ${NEXT_PUBLIC_CONTEXT}";
next build;
