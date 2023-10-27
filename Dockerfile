FROM nginx:stable

# remove the default files created by docker nginx
RUN rm /etc/nginx/conf.d/default.conf && \
	rm -rf /usr/share/nginx/html/*

# copy the configuration file to the docker container
COPY default.conf /etc/nginx/conf.d/default.conf

# copy the (www) app file assets together with the index.html
COPY www /usr/share/nginx/html