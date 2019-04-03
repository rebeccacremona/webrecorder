FROM webrecorder/pywb:2.2.20190227

WORKDIR /build

ADD webrecorder/requirements.txt /build/

RUN pip install -U pip \
    && pip install git+https://github.com/FedericoCeratto/bottle-cork.git@94d4017a4d1b0d20328e9283e341bd674df3a18a#egg=bottle-cork \
    && pip install -r requirements.txt

RUN useradd -ms /bin/bash -u 1000 archivist
USER archivist

WORKDIR /code

COPY --chown=archivist:archivist webrecorder /code/

ENTRYPOINT []
