#!/bin/bash
cd /home/kavia/workspace/code-generation/feedbackflow-35020-d7e7e7e8/feedback_frontend_workspace/feedback_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

