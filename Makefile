.PHONY: lint test dist test_dist clean check

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
