@echo off
set DAY=%1
if "%DAY%"=="" set DAY=2
node scripts/push-step.mjs %DAY%
