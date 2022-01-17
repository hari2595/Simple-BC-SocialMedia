pragma solidity ^0.5.0;

contract SocialNetwork {
	string public name;
	uint public postCount = 0;
	mapping(uint => Post) public posts;

	struct	Post {
		uint id;
		string content;
		uint tip;
		address payable author;
	}

	event PostCreated(
		uint id,
		string content,
		uint tip,
		address payable author
	);

	event PostTipped(
		uint id,
		string content,
		uint tip,
		address payable author
	);


	constructor() public {
		name = "Blockchain Network";
	}

	function create(string memory _content) public {
		// requirment of non emoty post
		require(bytes(_content).length > 0);
		postCount ++;
		posts[postCount] = Post(postCount, _content, 0, msg.sender);
		emit PostCreated(postCount, _content, 0, msg.sender);
	}

	function tipPost(uint _id) public payable {

		require(_id > 0 && _id <= postCount);
		// fetching the post
		Post memory _post = posts[_id];

		// fetchig the author
		address payable _author = _post.author;

		// paying author
		address(_author).transfer(msg.value);

		// adding the tip value
		_post.tip= _post.tip + msg.value;


		// updating
		posts[_id] = _post;

		// triggering the event
		emit PostTipped(postCount, _post.content, _post.tip, _author);
	}


}
