const { assert } = require('chai');
const { default: Web3 } = require('web3');

const SocialNetwork = artifacts.require("SocialNetwork");

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('SocialNetwork', ([deployer, author, tipper]) => {
	let socialNetwork

	before(async () => {
		socialNetwork = await SocialNetwork.deployed()
	})

	describe('deployment', async () => {
		it('deploys successfully', async () => {
			const address = await socialNetwork.address
			assert.notEqual(address, 0x0)
			assert.notEqual(address, '')
			assert.notEqual(address, null)
			assert.notEqual(address, undefined)
		
		})
		it('name check', async () => {
			const name = await socialNetwork.name()
			assert.equal(name, 'Blockchain Network')
		})
	})

	describe('posts', async () => {
		let result, postCount

		before(async () =>{
			result = await socialNetwork.create('Hi', { from: author })
			postCount = await socialNetwork.postCount()
		} )


		it('create post', async () => {
			// success
			assert.equal(postCount, 1)
			const event = result.logs[0].args
			assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
			assert.equal(event.content, 'Hi', 'Content is also correct')
			assert.equal(event.tip, '0', 'Tip ammount is correct')
			assert.equal(event.author, author, 'author is also correct')

			// failure case
			await socialNetwork.create('', { from: author }).should.be.rejected;

		})

		it('list post', async () => {
			const post = await socialNetwork.posts(postCount)
			assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
			assert.equal(post.content, 'Hi', 'Content is also correct')
			assert.equal(post.tip, '0', 'Tip ammount is correct')
			assert.equal(post.author, author, 'author is also correct')
		})

		it('tip post', async () => {

			// check old tip balance
			let oldAuthorBalance
			oldAuthorBalance = await web3.eth.getBalance(author)
			oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

			// filling the tip
			result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether')})
			// success
			const event = result.logs[0].args
			assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
			assert.equal(event.content, 'Hi', 'Content is also correct')
			assert.equal(event.tip, '1000000000000000000', 'Tip ammount is correct')
			assert.equal(event.author, author, 'author is also correct')

			// check new tip balance of author
			let newAuthorBalance
			newAuthorBalance = await web3.eth.getBalance(author)
			newAuthorBalance = new web3.utils.BN(newAuthorBalance)

			let tipAmount
			tipAmount = web3.utils.toWei('1', 'Ether')
			tipAmount = new web3.utils.BN(tipAmount)

			const expectedBalance = oldAuthorBalance.add(tipAmount)

			assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

			// FAILURE CASE: IF TIPPED TO USER THAT DOES NOT EXIST
			await socialNetwork.tipPost(99, {from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		})
	})
})