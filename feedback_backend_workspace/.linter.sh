#!/bin/bash
cd /home/kavia/workspace/code-generation/feedbackflow-35020-d7e7e7e8/feedback_backend_workspace/feedback_backend
source venv/bin/activate
flake8 .
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

