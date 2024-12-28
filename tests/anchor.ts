import BN from "bn.js";
import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

// describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TodoList as anchor.Program<TodoList>;
  
//   it("initialize", async () => {
//     // Generate keypair for the new account
//     const newAccountKp = new web3.Keypair();

//     // Send transaction
//     const data = new BN(42);
//     const txHash = await program.methods
//       .initialize(data)
//       .accounts({
//         newAccount: newAccountKp.publicKey,
//         signer: program.provider.publicKey,
//         systemProgram: web3.SystemProgram.programId,
//       })
//       .signers([newAccountKp])
//       .rpc();
//     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

//     // Confirm transaction
//     await program.provider.connection.confirmTransaction(txHash);

//     // Fetch the created account
//     const newAccount = await program.account.newAccount.fetch(
//       newAccountKp.publicKey
//     );

//     console.log("On-chain data is:", newAccount.data.toString());

//     // Check whether the data on-chain is equal to local 'data'
//     assert(data.eq(newAccount.data));
//   });
// });

import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TodoList } from "../target/types/todo_list"; // Auto-generated IDL
import { Keypair, SystemProgram } from "@solana/web3.js";
import type { TodoList } from "../target/types/todo_list";

describe("todo_list", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TodoList as Program<TodoList>;
  const user = provider.wallet.publicKey;

  let todoList: Keypair;

  it("Initializes a to-do list", async () => {
    todoList = Keypair.generate();

    await program.methods
      .initialize()
      .accounts({
        todoList: todoList.publicKey,
        user: user,
        systemProgram: SystemProgram.programId,
      })
      .signers([todoList])
      .rpc();

    const account = await program.account.todoList.fetch(todoList.publicKey);
    console.log("Initialized To-Do List:", account);
    expect(account.owner.toBase58()).toEqual(user.toBase58());
  });

  it("Adds a task to the to-do list", async () => {
    const content = "Write Solana tests";

    await program.methods
      .addTasks(content)
      .accounts({
        todoList: todoList.publicKey,
        user: user,
      })
      .rpc();

    const account = await program.account.todoList.fetch(todoList.publicKey);
    console.log("To-Do List After Adding Task:", account);
    expect(account.tasks[0].content).toEqual(content);
    expect(account.tasks[0].completed).toEqual(false);
  });

  it("Completes a task in the to-do list", async () => {
    await program.methods
      .completeTask(new anchor.BN(0))
      .accounts({
        todoList: todoList.publicKey,
        user: user,
      })
      .rpc();

    const account = await program.account.todoList.fetch(todoList.publicKey);
    console.log("To-Do List After Completing Task:", account);
    expect(account.tasks[0].completed).toEqual(true);
  });

  it("Deletes a task from the to-do list", async () => {
    await program.methods
      .deleteTask(new anchor.BN(0))
      .accounts({
        todoList: todoList.publicKey,
        user: user,
      })
      .rpc();

    const account = await program.account.todoList.fetch(todoList.publicKey);
    console.log("To-Do List After Deleting Task:", account);
    expect(account.tasks.length).toEqual(0);
  });
});

