Sample invocation: generate the image harvardlil/webrecorder:0.05
with the command line:

```
docker build -f perma/webrecorder/Dockerfile -t harvardlil/webrecorder:0.05 .
```

To test your changes locally:
- build the image, making sure to increment the tag
- alter Perma's `docker-compose` file to point to the new version, which will exist locally on your machine. (Though the image will not yet be on Docker Hub, its local name will be identical to that future public version, so all you have to do is increment the version number.)
- spin up Perma, attempt a playback
- toggle Perma's `wr.env` to use the test-specific settings; re-run `docker-compose up`; run Perma's test suite
- rebuild the Webrecorder Docker image as necessary, and repeat
- when ready, push to Docker Hub:

```
docker push harvardlil/webrecorder:0.05
```


CHANGELOG
---------
### 0.08
- Update to Webrecorder '4.2.1'
- Pin Pywb image version, as Webrecorder now does
- New Pywb is configured to create the archivist user using a docker entrypoint script, so that the UID/GID can be set to match the user who owns the warcs volume, which is a bind mount in standard Pywb/Webrecorder deployments. This is undesirable for Perma, since we are using named volumes, which are managed by the docker daemon and thus are normally owned by root. So, we are creating the archivist user as in earlier versions of Pywb and are overriding ENTRYPOINT to prevent the default entrypoint script from running.

### 0.07
- Update to Webrecorder 4.2.0
- Don't do any directory-related work in `Dockerfile`; will be achieved via the ENTRYPOINT script for the `recorder` container.

### 0.06
- Expose the pre-populated, chown'ed `/data` directory as a volume to
avoid permissions problems when using named volumes.
