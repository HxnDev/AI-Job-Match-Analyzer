.PHONY: format check clean

# Format code
format:
	ruff check --fix app/
	ruff format app/

# Check code without modifying
check:
	ruff check app/
	ruff format --check app/

# Clean cache files
clean:
	rm -rf .ruff_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +