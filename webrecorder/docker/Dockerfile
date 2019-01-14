FROM webrecorder/pywb:develop

WORKDIR /build

ADD requirements.txt /build/

USER root

RUN pip install -U pip \
    && pip install git+https://github.com/FedericoCeratto/bottle-cork.git@94d4017a4d1b0d20328e9283e341bd674df3a18a#egg=bottle-cork \
    && pip install -r requirements.txt


RUN mkdir -p /data/warcs \
    && mkdir /data/storage \
    && chown -R archivist:archivist /data

USER archivist

WORKDIR /code

COPY --chown=archivist:archivist . /code/
