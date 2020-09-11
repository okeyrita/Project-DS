FROM nginx

MAINTAINER r.saitova@innopolis.university

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /etc/nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
