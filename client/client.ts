import BN from "bn.js";
import * as web3 from "@solana/web3.js";
// Client
// console.log("My address:", program.provider.publicKey.toString());
// const balance = await program.provider.connection.getBalance(program.provider.publicKey);
// console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

import { AnchorProvider, Program, Wallet, web3 } from "@project-serum/anchor";
import { TodoList, IDL } from "./todo_list"; // Your program IDL and type definitions
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import type { TodoList } from "../target/types/todo_list";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.TodoList as anchor.Program<TodoList>;


// Define the program ID
const programID = new PublicKey("J7eTWsjqa57Vsp79JzLd3sxpUzkNgzboXyDpynnwVuzR");

// Initialize the provider and program
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new Wallet(Keypair.generate()); // Replace with your wallet
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program<TodoList>(IDL, programID, provider);

// Functions for interacting with the program
export const initializeTodoList = async (user: PublicKey) => {
  const todoList = Keypair.generate(); // Create a new account for the todo list
  await program.methods
    .initialize()
    .accounts({
      todoList: todoList.publicKey,
      user: user,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([todoList])
    .rpc();
  return todoList.publicKey;
};

export const addTask = async (todoList: PublicKey, user: PublicKey, content: string) => {
  await program.methods
    .addTasks(content)
    .accounts({
      todoList: todoList,
      user: user,
    })
    .rpc();
};

export const completeTask = async (todoList: PublicKey, user: PublicKey, index: number) => {
  await program.methods
    .completeTask(new web3.BN(index))
    .accounts({
      todoList: todoList,
      user: user,
    })
    .rpc();
};

export const deleteTask = async (todoList: PublicKey, user: PublicKey, index: number) => {
  await program.methods
    .deleteTask(new web3.BN(index))
    .accounts({
      todoList: todoList,
      user: user,
    })
    .rpc();
};

