# Cross-PC workflow

This project is intentionally synchronized through its GitHub repository. The user works on only one PC at a time and has approved using this public repository.

## Before starting work

1. Check `git status --short --branch`.
2. If the worktree is clean, fetch and fast-forward the current branch from `origin` before editing.
3. If there are local changes, commits not pushed, a merge/rebase in progress, or a divergence from `origin`, preserve all files and report the state before proceeding. Never discard, reset, force-push, or overwrite work to make synchronization succeed.

## After completing requested work

1. Run only the validation relevant to the request. For explicit verification, use the existing `lint` and/or `build` scripts when dependencies are available; do not install tools or dependencies without need.
2. Review the changed-file list and diff. Never commit credentials, `.env` files, private keys, or unrelated user changes.
3. Since the user approved automatic cross-PC synchronization, stage only files changed for the requested task, create a descriptive commit, and push the current branch to `origin` when the work is complete and validation succeeds (or when no validation is relevant).
4. If validation fails, authentication is unavailable, or the remote rejects the push, keep the local changes intact and tell the user what remains. Do not force-push or silently leave the changes unsynced.

## Release safety

GitHub synchronization does not publish or submit the app to App-in-Toss. Do not upload, release, or change production settings in the Toss console unless the user explicitly requests that action.
