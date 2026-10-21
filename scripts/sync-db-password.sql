-- Read credentials inside the container, without putting the password in argv.
\getenv db_user POSTGRES_USER
\getenv db_password POSTGRES_PASSWORD
SELECT format('ALTER ROLE %I WITH PASSWORD %L', :'db_user', :'db_password')
\gexec
