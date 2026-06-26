# Lorekeeper
A project for web client class

## How to run

Because the project uses javascript module system, 
it has to run in some type of http server to provide the html pages.

This is because most browser intentionally block the file:// protocol
to import js modules.

If you have python installed, you can run the built-in http server util on the project root:

```bash
python -m http.server 8000 
```
