use stringstore;

CREATE TABLE messages (
    digest CHAR(64) NOT NULL PRIMARY KEY,
    message VARCHAR(1000) NOT NULL
);
