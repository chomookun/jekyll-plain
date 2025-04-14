# jekyll-plain

jekyll plain theme

## upgrades ruby
```shell
brew install ruby
rbenv init -

vim ~/.zshrc
...
// inserts rbenv output
...
```

## Installs jekyll
```shell
gem install --user-install jekyll bundler
```

## Installs packages
```shell
bundle install --path vendor/bundle
````

## Starts
```shell
bundle exec jekyll clean && bundle exec jekyll serve --trace
```

## Usage
```shell
bundle init
```