(()=>{
	
console.log('LAST OF ROBLOX: friends.js attached');


const headers = new Headers;
headers.append('Content-Type', 'application/json');
headers.append('X-CSRF-TOKEN', Roblox.XsrfToken.getToken());

async function send(url:string, obj:any):Promise<void>
{
	const resp = await fetch('/api/'+url, {
		method: 'POST',
		headers,
		body:JSON.stringify(obj)
	});
	const res = JSON.parse(await resp.text());
	if (!res.success) throw Error(res.message);
}

function sendFriendRequest(id:number):Promise<void>
{
	console.log(`sendfriendrequest: ${id}`);
	return send('friends/sendfriendrequest', {targetUserID: id});
}

function removeFriend(id:number):Promise<void>
{
	console.log(`removefriend: ${id}`);
	return send('friends/removefriend', {targetUserID: id});
}

const userData = {
	id:0,
	name:'',
	isunder13:'',
};

{
	const metas = document.head.getElementsByTagName('meta');
	for (var i=0;i<metas.length;i++)
	{
		const meta = metas[i];
		if (meta.name === "user-data")
		{
			userData.id = +meta.getAttribute('data-userid');
			userData.name = meta.getAttribute('data-name') || '';
			userData.isunder13 = meta.getAttribute('data-isunder13') || '';
		}
	}
}

interface Friend
{
	UserId:number;

}

interface FriendList
{
	Friends:Friend[];
}

async function listFriend(myId:number):Promise<FriendList>
{
	// currentPage=0
	// pageSize=18
	const resp = await fetch(`/users/friends/list-json?friendsType=AllFriends&imgHeight=100&imgWidth=100&userId=${myId}&pageSize=200`);
	return JSON.parse(await resp.text());
}

const buttons = document.createElement('div');
const resetButton = document.createElement('button');
resetButton.className = "btn-control-md";
resetButton.innerHTML = "Delete & Request All";
resetButton.onclick = ()=>{
	if (!confirm("It will removes all friends and request friend again.")) return;
	(async ()=>{
		var friendRemoving = 0;
		try
		{
			const list = await listFriend(userData.id);
			for (const friend of list.Friends)
			{
				friendRemoving = friend.UserId;
				await removeFriend(friend.UserId);
				await sendFriendRequest(friend.UserId);
				friendRemoving = 0;
				await new Promise(resolve=>setTimeout(resolve, 500));
			}
		}
		catch (err)
		{
			if (friendRemoving) console.error(`Remove Warning: https://web.roblox.com/users/${friendRemoving}/profile/`);
			console.error(err);
		}
	})();
};
buttons.appendChild(resetButton);

const section = document.getElementsByClassName('friends-content section')[0];
if (section.parentNode)
{
	section.parentNode.insertBefore(buttons, section);
}

})();