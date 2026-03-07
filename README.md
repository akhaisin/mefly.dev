# mefly.dev

## Local dev

```shell
# Install Ruby
sudo apt-get install ruby-full build-essential zlib1g-dev
# Install bundler 
sudo gem install bundler
# Configure bundler to install to local project directory
bundle config set --local path '.bundle/vendor'
# Install from Gemfile 
bundler install
# Serve the site 
bundle exec jekyll serve

```