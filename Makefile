.PHONY: lint test dist test_dist clean check image

VERSION = $(shell node -pe "require('./package.json').version")
DOCKER_IMAGE_NAME = vgs-satellite
DOCKER_REPO = verygoodsecurity

lint:
	flake8 satellite

test:
	coverage run -m pytest satellite/tests -m "not dist"

dist:
	pyinstaller --clean --hidden-import sqlalchemy.ext.baked -n vgs-satellite-backend -y --onefile app.py

test_dist:
	pytest satellite/tests -m "dist"

clean:
	find satellite -name "*.pyc" | xargs -I {} rm -rf {}

# Run this before push
check: lint test dist test_dist
	@echo "All good, push your changes."

pin_requirements:
	pip-compile --output-file=requirements.txt requirements.in

image:
	docker build -t ${DOCKER_REPO}/${DOCKER_IMAGE_NAME}:${VERSION} .
