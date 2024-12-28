use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("J7eTWsjqa57Vsp79JzLd3sxpUzkNgzboXyDpynnwVuzR");

#[program]
pub mod todo_list {
    use super::*;

    // Initialize a new todo list
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let todo_list = &mut ctx.accounts.todo_list;
        todo_list.owner = *ctx.accounts.user.key;
        todo_list.tasks = vec![];
        Ok(())
    }

    // Add tasks
    pub fn add_task(ctx: Context<AddTask>, content: String) -> Result<()> {
        let todo_list = &mut ctx.accounts.todo_list;

        // Check if the user is the owner
        require!(todo_list.owner == *ctx.accounts.user.key, ErrorCode::Unauthorized);

        // Add a new task
        todo_list.tasks.push(Task {
            content,
            is_completed: false,
        });

        Ok(())
    }

    //Marks a task as complete
    pub fn complete_task(ctx: Context<CompleteTask>, index: u64) -> Result<()> {
        let todo_list = &mut ctx.accounts.todo_list;

        // Ensure only the owner can modify tasks
        require!(todo_list.owner == *ctx.accounts.user.key, ErrorCode::Unauthorized);

        // Mark the task as completed
        if let Some(task) = todo_list.tasks.get_mut(index as usize) {
            task.is_completed = true;
        } else {
            return Err(ErrorCode::TaskNotFound.into());
        }
        Ok(())
    }

    // Delete tasks (example: remove the last task)
    pub fn delete_task(ctx: Context<DeleteTask>, index: u64) -> Result<()> {
        let todo_list = &mut ctx.accounts.todo_list;

        // Check if the user is the owner
        require!(todo_list.owner == *ctx.accounts.user.key, ErrorCode::Unauthorized);

        // Remove the last task (or implement custom logic for deletion)
        // todo_list.tasks.pop();

         // Remove the task by index
        if (index as usize) < todo_list.tasks.len() {
            todo_list.tasks.remove(index as usize);
        } else {
            return Err(ErrorCode::TaskNotFound.into());
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 32 bytes for the owner's public key,
    // and 1024 bytes for storing tasks.
    #[account(init, payer = user, space = 8 + 32 + 1024)]
    pub todo_list: Account<'info, TodoList>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddTask<'info> {
    #[account(mut)]
    pub todo_list: Account<'info, TodoList>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub todo_list: Account<'info, TodoList>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    #[account(mut)]
    pub todo_list: Account<'info, TodoList>,
    pub user: Signer<'info>,
}

#[account]
pub struct TodoList {
    pub owner: Pubkey,
    pub tasks: Vec<Task>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Task {
    pub content: String,
    pub is_completed: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("The requested task does not exist.")]
    TaskNotFound,
}
