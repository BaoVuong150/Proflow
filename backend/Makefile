.PHONY: lint test fresh setup

lint:
	./vendor/bin/pint

test:
	./vendor/bin/pest

fresh:
	php artisan migrate:fresh --seed

setup:
	composer install
	npm install
	php artisan key:generate
	php artisan migrate
