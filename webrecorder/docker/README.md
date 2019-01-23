This branch of this fork is intended to track the master branch
webrecorder/webrecorder and provide a mechanism for building a basic
webrecorder image for use in the Perma ecosystem.

Sample invocation: generate the image harvardlil/webrecorder:0.05
with the command line:

```
docker build -f docker/Dockerfile -t harvardlil/webrecorder:0.05 .
```

CHANGELOG
---------

### 0.06 
Expose the pre-populated, chown'ed `/data` directory as a volume to 
avoid permissions problems when using named volumes.
