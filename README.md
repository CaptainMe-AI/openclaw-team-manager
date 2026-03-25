Rails app - `source/dashboard`

# Developer Info

## Ruby version
  `3.3.3`

## Local Setup

1. Install Ruby
   - Use ruby manager as [rvm](https://rvm.io/)
   - current version of Ruby is `3.3.3`
   - RVM installation gotha on Mac M1 [HERE](https://stackoverflow.com/questions/66645381/installing-ruby-with-ruby-install-causes-build-error-on-mac-m1), you must run
   `arch -x86_64 rvm install 3.3.3 --with-openssl-dir=/usr/local/opt/openssl@3`

2. Install Gems by running

`bundle install`

3. Run Dependency Containers with Docker

The following will run PSQL in Docker. It is highly recommended to use the setup instead of local versions. It will guarantee that your project will run the same version as the production.

   FRIENDLY WARNING, IF YOU DECIDE TO DO A DIFFERENT SETUP, YOU WILL MOST LIKELY DIVERGE FROM THE DESIRED SETUP AND BE ON YOUR OWN!

   - Install [Docker Client](https://docs.docker.com/get-started/overview/)
   - Fort M Processorrun `docker-compose -p openclaw-team-manager -f setup/Dockerfile-local-services.yml up -d`

4. Set up Env files
  - Local Dev - `cp env.sample.development .env.development`. DO NOT COMMIT THE NEW FILE - `.env.development`
  - Local Tests - `cp env.sample.test .env.test.local`. DO NOT COMMIT THE NEW FILE - `.env.test`

5. Set up the Database for `development` & `testing` env
  - `bundle exec rake db:setup`

  - IMPORTANT: We are using `schema_dump` option with uses local installation of `pg_dump``. Running `rake db:migrate` will cause
    that. If you do not have a matching local version of `pg_dump` as the docker DB version, you will get an error.
    Way to fix it:
    1. Install the same version of psql localy - `brew install postgresql@17`
    2. Link to that version `brew link postgresql@17 --force`
    3. Note that if this might brake other projects, you can fix that by linking the version you need when working
    on the other project
    4. Check version `pg_dump --version` - must be 17.x.x

6. Set up the Database for `development` & `testing` env
  - `bundle exec rake db:setup`

7. Install js dependencies
  - `yarn install`

8. Running Web Server + Vite(frontend) Server
 - `bin/dev`
 - got to `http://localhost:3000`