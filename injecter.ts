console.log('LAST OF ROBLOX LOADED');

function inject(src:string):void
{
	const id = "last_of_roblox_"+src.replace(/\./g, "_");

	const oriScript = document.getElementById(id);
	if (oriScript) oriScript.remove();

	const extension = (typeof chrome !== 'undefined') ? chrome.extension : browser.extension;
	const script = document.createElement('script');
	script.id = id;	
	script.src = extension.getURL(src);
	document.body.appendChild(script);
}

try
{
	const path = location.pathname;
	if (path.startsWith("/games/"))
	{
		inject('games.js');
	}
	else if(path === "/users/friends")
	{
		inject('friends.js');
	}
}
catch(err)
{
	console.error(err);
}

