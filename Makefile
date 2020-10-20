.PHONY: lint test dist test_dist clean

lint:
	flake8 satellite

test:
	pytest satellite/tests -m "not dist"

dist:
	pyinstaller --clean --hidden-import sqlalchemy.ext.baked -n vgs-satellite-backend -y --onefile app.py

test_dist:
	pytest satellite/tests -m "dist"

clean:
	find satellite -name "*.pyc" | xargs -I {} rm -rf {}
