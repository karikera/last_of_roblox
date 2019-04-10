
declare const Roblox:{
	XsrfToken:{
		getToken():string;
	},
	Lang:{
		ServerListResources:{
			[key:string]:string;
		},
		FriendsResources:{
			[key:string]:string;
		},
	},
	Endpoints:{
		getAbsoluteUrl(url:string):string,
	},
	RunningGameInstances:{
		populateAvatarImages(gameSectionPath:string):void,
		bindPopovers(gameSectionPath:string):void,
	},
}

declare const intl:{
	f(name:string, opt:{currentPlayers: number,maximumAllowedPlayers: number}):string,
};