from . import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5050))
    app.run(debug=True, port=port)