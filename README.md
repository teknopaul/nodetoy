
Node toy is a server that does JSON CRUD, so you can write desktop APPs that use the browser by writing just HTML and JavaScript.

The server has no database, JSON is stored directly on the file system.

The server responds to AJAX requests containing JSON and follows REST principals.

## The Rules

All requests to process JSON data must start with `/data/`.

If you POST `{"userID" : 1, "Bob"}`  to  `/data/user/Bob.json`

The server will create a file called `users/Bob.json` in the directory configured to store data (by default, ./data).

The JSON can be retrieved by doing a GET from `/data/user/Bob.json`

The file is deleted by sending a DELETE to `/data/user/Bob.json`.


To get a list of all the `*.json` files in a directory send a GET to the directory `/data/user/`.

## The Test Page
If that was not simple enough already you can try it out using the test page at  `/app/test.html` before you write any JavaScript.
This gives you a GUI view of the requests.

The server also serves HTML, CSS, JS and images from a directory called `/app/` this is where you add your front end code.

## Configuration
Configuration is simple, there is an XML file `conf/config.xml` containing a few variables including the port to listen on, 
the location of `/app/` and the location of `/data/`

You can add other parameters in the config file, the whole file config it is made available as JSON if you send a GE to `/config/`


## Server Side Includes
All HTML has SSI includes processed, although the full spec of Apache SSI is not supported, including files and variables is.

You can add variables to the SSI environment (Like Apache's SetEnv command) by editing the `/config/ssi-environment.xml` file.

## Security

There is no security, there are no users, no logins and all files are accessible even if the files are not JSON.  
If that bothers you, use a firewall.

If your app ever grows up to the extent that you want to publish on t'internet it you can add a security filter.


## Example
At `/app/todo.html` there is a simple TODO list app for the FireFox sidebar as an example. 
