.PHONY: lint test dist test_dist clean check pin_requirements upgrade_requirements docker_image docker_publish

VERSION = $(shell ./scripts/version.sh)
LATEST_VERSION = $(shell git tag | sort -Vr | head -n 1)
DOCKER_ORG = verygood
DOCKER_REPO = satellite
DOCKER_IMAGE_NAME = ${DOCKER_ORG}/${DOCKER_REPO}

lint:
	flake8 satellite app.py

test:
	coverage run -m pytest satellite/tests -m "not dist"

dist: clean
	pyinstaller \
	-y \
	--clean \
	--onefile \
	-n vgs-satellite-backend \
	--hidden-import sqlalchemy.ext.baked \
	--hidden-import logging.config \
	--add-data satellite/db/migrations:satellite/db/migrations \
	 app.py

test_dist:
	pytest satellite/tests -m "dist"

clean:
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete

# Run this before push
check: lint test dist test_dist
	@echo "All good, push your changes."

pin_requirements:
	pip-compile --output-file=requirements.txt requirements.in

upgrade_requirements:
	pip-compile -U --output-file=requirements.txt requirements.in

docker_image:
	docker build -t ${DOCKER_IMAGE_NAME}:${VERSION} .
ifeq (${VERSION},${LATEST_VERSION})
	docker tag ${DOCKER_IMAGE_NAME}:${VERSION} ${DOCKER_IMAGE_NAME}:latest
endif

docker_publish: docker_image
	echo ${DOCKER_ACCESS_TOKEN} | docker login -u ${DOCKER_USER} --password-stdin
	docker push ${DOCKER_IMAGE_NAME}:${VERSION}
ifeq (${VERSION},${LATEST_VERSION})
	docker push ${DOCKER_IMAGE_NAME}:latest
endif
