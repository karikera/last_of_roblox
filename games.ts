(()=>{

console.log('LAST OF ROBLOX: games.js attached');

var oldContainer = document.getElementById('kr_last_of_roblox_container');
if (oldContainer)
{
	oldContainer.remove();
	oldContainer = null;
}

try
{
	const detail = document.getElementById('game-detail-page');
	const gamePlaceId = detail.getAttribute('data-place-id');
	
	const info = {
		runningGamesSectionPath: '#rbx-running-games',
		gameServerBase: 'rbx-game-server',
		gameServerClassBase: '',
		templatePath: '',
	};
	info.gameServerClassBase = '.' + info.gameServerBase;
	info.templatePath = info.runningGamesSectionPath + ' ' + info.gameServerClassBase + '-template';

	interface FindPagePlayer{
		Id:number,
		Username:string,
		Thumbnail:{
			Url:string,
			IsFinal:boolean
		},
	};
	interface FindPageItem{
		ShowSlowGameMessage:boolean;
		Capacity:number,
		CurrentPlayers:FindPagePlayer[],
		PlaceId:number,
		Guid:string,
		ShowShutdownAllButton:boolean,
		JoinScript:string,
	};
	interface FindPageResult{
		Collection:FindPageItem[];
	};
	
	function createItem(r:FindPageItem, u:boolean):string
	{
		var o = info.gameServerClassBase;
		var a = info.gameServerBase;
		var e = $(info.templatePath).clone();
		var p = r.Capacity;
		var y = r.CurrentPlayers;
		var w = y.length;
		var h = Math.floor(Math.random() * 1000000);
		var k = '<a class="rbx-menu-item" data-toggle="popover-dynamic" data-bind="game-server-context-menu-' + h + '" data-original-title="" title="" data-viewport=' + o + '-item><i class="icon-more"></i></a><div class="rbx-popover-content" data-toggle="game-server-context-menu-' + h + '"><ul class="dropdown-menu" role="menu"><!--<li><a href="#">' + Roblox.Lang.ServerListResources['Action.ConfigureServer'] + '</a></li>--><li><a href="#" class=' + a + '-shutdown>' + Roblox.Lang.ServerListResources['Label.ShutDownServer'] + '</a></li></ul>';
		e.find('.rbx-game-server-title').html('&nbsp;');
		e.find('.rbx-game-server-status').text(intl.f(Roblox.Lang.ServerListResources['Label.CurrentPlayerCount'], {
			currentPlayers: w,
			maximumAllowedPlayers: p
		}));
		e.find(o + '-join').attr('data-placeid', r.PlaceId);
		e.find(o + '-item').attr('data-gameid', r.Guid).attr('data-show-shutdown-all', r.ShowShutdownAllButton+'');
		u && e.find(o + '-menu').html(k);
		e.find('.rbx-menu-item').attr('data-bind', 'game-server-context-menu-' + h);
		e.find('.rbx-popover-content').attr('data-toggle', 'game-server-context-menu-' + h);
		e.find(o + '-join').attr('onclick', r.JoinScript);
		r.ShowSlowGameMessage || e.find(o + '-alert').addClass('hidden');
		var c = '';
		var b = 'headshot-thumbnail';
		var i:string;
		for (i in y)
		{
			var s = y[i];
			var l = '';
			s.Id > 0 ? (s.Thumbnail.IsFinal || (l = 'data-retry-url=\'/' + b + '/json?userId=' + s.Id + '&width=48&height=48&format=PNG\''), c += '<span class=\'avatar avatar-headshot-sm player-avatar\'><a class=\'avatar-card-link\' href=\'' + Roblox.Endpoints.getAbsoluteUrl('/users/' + s.Id + '/profile') + '\' ' + l + ' title=\'' + s.Username + '\'><img class=\'avatar-card-image\' src=\'' + s.Thumbnail.Url + '\'></a></span>')  : c += '<span class=\'avatar avatar-headshot-sm player-avatar\'><a class=\'avatar-card-link\' ' + l + '><img class=\'avatar-card-image\' src=\'' + s.Thumbnail.Url + '\'></a></span>';
		}
		e.find(o + '-players').html(c);
		return e.html();
	}
	
	function findPage(startIndex:number):Promise<FindPageResult>
	{
		return new Promise((resolve, reject)=>{
			$.ajax({
				type: 'GET',
				url: '/games/getgameinstancesjson',
				data: { placeId: gamePlaceId, startIndex },
				cache: false,
				contentType: 'application/json; charset=utf-8',
				success: function (resp) {
					resolve(resp);
				},
				error: function () {
					gameListContainer.find('.loading').remove().append('<div class=\'empty\'>' + Roblox.Lang.ServerListResources['Label.PlacesNotLoading'] + '</div>');
					reject();
				}
			});
		});
	}

	function getLastItemFromCollection(collection:FindPageItem[]):FindPageItem|undefined
	{
		var i = collection.length;
		while (i--)
		{
			const v = collection[i];
			if (v.ShowSlowGameMessage) continue;
			return v;
		}
		return undefined;
	}

	function addServerList(targetCollection:FindPageItem[]):void
	{
		const showShutdownAllButton = false;
		const gameSectionPath = info.runningGamesSectionPath;
		const maxRow = +$(info.runningGamesSectionPath).attr('data-maximumrows');

		$(gameSectionPath).attr('data-showshutdown', showShutdownAllButton+'');

		for (var i=targetCollection.length-1;i>=0;i--)
		{
			const target = targetCollection[i];
			const container = $('<div></div>');
			container.append(createItem(target, showShutdownAllButton));
			gameListContainer.append(container.html());
		}
	
		Roblox.RunningGameInstances.populateAvatarImages(gameSectionPath);
		Roblox.RunningGameInstances.bindPopovers(gameSectionPath);
	}

	const PAGE_SIZE = 10;

	async function findLastPage():Promise<FindPageItem[]>
	{
		const stats = detail.getElementsByClassName('game-stat');
		const playerCount = +stats[0].getElementsByClassName('text-lead')[0].innerHTML.replace(/,/g, '');
		const maxCount = +stats[5].getElementsByClassName('text-lead')[0].innerHTML;
		const serverMinimum = playerCount / maxCount | 0;
	
		var L = serverMinimum / PAGE_SIZE - 1 | 0;
		var C = serverMinimum * (1.2 / PAGE_SIZE) | 0;
		var R = Infinity;

		if (L == 0) L = 1;
		if (C == 0) C = 1;
		
		var resp:FindPageResult;
		var collection:FindPageItem[];
		var targetCollection:FindPageItem[];
		var targetPage = 0;
		for (;;)
		{
			console.log(`Searching ${L} < x < ${R}, x = ${C}?`);
			resp = await findPage(C * PAGE_SIZE);
			collection = resp.Collection;
			if (collection.length === 0)
			{
				if (L == C)
				{
					if (targetPage) break;
					if (L == 1) break;
					L = L >> 1;
					if (L == 0) L = 1;
				}
				R = C;
				C = (L + R) >> 1;
			}
			else if (collection.length >= 10)
			{
				targetPage = C;
				targetCollection = collection;

				L = C + 1;
				if (R == Infinity)
				{
					C = Math.max(C * 1.2 | 0, C + 1);
				}
				else
				{
					if (L == R) break;
					C = (L + R) >> 1;
				}
			}
			else
			{
				targetPage = C;
				targetCollection = collection;
				break;
			}
		}
		
		if (!targetCollection) return null;
		lastPage = targetPage;
		console.log(`Result: x = ${targetPage}`);
		return targetCollection;
	}

	var lastPage = -1;
	
	const topContainer = document.getElementsByClassName('rbx-running-games-footer')[0].parentNode;

	const container = document.createElement('div');
	container.id = 'kr_last_of_roblox_container';
	container.style.marginTop = '5px';
	topContainer.appendChild(container);

	const gameListContainer = $('<ul></ul>');	
	gameListContainer.addClass("section rbx-game-server-item-container stack-list");
	container.appendChild(gameListContainer[0]);

	const footer2 = document.createElement('div');
	footer2.className = 'rbx-running-games-footer';
	container.appendChild(footer2);

	const button = document.createElement('button');
	button.className = "btn-control-sm btn-full-width";
	button.type = "button";
	footer2.appendChild(button);
	
	const buttonText = document.createTextNode('Search Last Server');
	button.appendChild(buttonText);
	button.onclick = msg=>{
		if (button.disabled) return;
		button.disabled = true;

		buttonText.nodeValue = `Searching ...`;

		if (lastPage === -1)
		{
			findLastPage().then(collection=>{
				if (collection)
				{
					addServerList(collection);
					buttonText.nodeValue = 'More From Last';
					button.disabled = false;
				}
				else
				{
					buttonText.nodeValue = 'Done';
				}
			}).catch(err=>console.error(err));
		}
		else if (lastPage !== 0)
		{
			lastPage --;
			buttonText.nodeValue = `Loading ...`;
			findPage(lastPage * PAGE_SIZE).then(resp=>{
				addServerList(resp.Collection);
				if (lastPage !== 1)
				{
					buttonText.nodeValue = 'More From Last';
					button.disabled = false;
				}
				else
				{
					buttonText.nodeValue = 'Done';
				}
			}).catch(err=>console.error(err));
		}
	};
	// findLastPage();	
}
catch(err)
{
	console.error(err);
}

})();