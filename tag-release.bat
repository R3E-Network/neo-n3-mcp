@echo off
rem Tag release script for Neo N3 MCP
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
echo "Tagged release v1.1.0"
