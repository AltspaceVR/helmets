/*
 * Automate fixing late user sync issues with Altspace.
 *
 * Usage:
 *		1. Create an instance of UserSyncFix with the constructor.  Pass it the minimum number of milliseconds
 *			between synchronizations.
 *			e.g.: syncfix = new UserSyncFix(5000);
 *		2. As you create items that need the synchronization fix (such as buttons/button behavior and attached objects),
 *			call addSyncFunc( <sync func> ).
 *			e.g. syncId = syncfix.addSyncFunc(reattachItem);
 *			For attached objects, the function should detach and reattach them.
 *			For a button, the function should set the ButtonBehaviors that were already set.
 *		3. In the App's userJoined() callback, call UserSyncFix's userJoined() function.
 *			e.g. syncfix.userJoined()
 *		4. As you delete an object (or want to stop synchronizing for some reason), call removeSyncFunc().
 *			e.g. syncfix.removeSyncFunc(syncId)
 *			'syncId' is the return value from a previous call to addSyncFunc().
 *	
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

export class UserSyncFix {
	// Map of syncId's to functions to call at each sync time.
	private syncFuncs = new Map<number, { (): void }>();
	private syncTimer: Promise<void>;
	private _autoSyncNbr: number = null;

	// The next ID to be used when a function is added.
	private nextId = 0;

	/**
	 * Constructor
	 * @param _minSyncIntervalms Minimum synchronization interval.  Users that join in an
	 *							interval with have their synchronization process "batched"
	 *							together to reduce the number of times it needs to happen.
	 */
	// Constructor.
	constructor(private _minSyncIntervalms: number) {
	}

	/**
	 * User should call this form the userJoined event handler to let this sync
	 * know that a new user has joined.
	 */
	public userJoined() {
		// If a timer hasn't already been created, add it.
		if (!this.syncTimer) {
			this.syncTimer = new Promise(resolve => setTimeout(resolve, this._minSyncIntervalms))
				.then(() => this._runSyncFuncs());
		}
	}

	/**
	 * runSyncFunc()
	 * Runs the synchronization functions after a timer has expired.
	 */
	private _runSyncFuncs() {
		// Set the syncTimer to null to prepare for the next user.
		this.syncTimer = null;

		// Loop through and execute all the sync functions.
		this.syncFuncs.forEach((f, id) => {
			f();
		});
	}

	/**
	 * Control whether to auto-synchronize attachments
	 * 
	 * @param context The context of the instance.
	 * @param sync true to synchronize, false to stop synchronizing.
	 */
	public autoSynchronizeAttachments(context: MRE.Context, sync: boolean = true) {
		/*
		 * If sync is true and we haven't already added the attachment
		 * sync function, add it.
		 */
		if (sync && (this._autoSyncNbr === null)) {
			this._autoSyncNbr = this.addSyncFunc(() => UserSyncFix._synchronizeAttachments(context));
		} else if (!sync && (this._autoSyncNbr !== null)) {
			/*
			 * Turn off synchronization.
			 */
			this.removeSyncFunc(this._autoSyncNbr);
			this._autoSyncNbr = null;
        }
	}

	/**
	 * Synchronize all attachments.
	 * 
	 * @param context The MRE.Context of the current instance of the MRE.
	 */
	private static _synchronizeAttachments(context: MRE.Context) {
		/* Loop through all the Actors, reattaching any that are attachments. */
		for (const actor of context.actors) {
			if (actor.attachment) {
				/* Save the attachpoint and userID so we can reattach them. */
				const attachPoint: MRE.AttachPoint = actor.attachment.attachPoint;
				const userId: MRE.Guid = actor.attachment.userId;

				/*
				 * Detatch and reattach the actor.
				 */
				actor.detach();
				actor.attach(userId, attachPoint);
            }
        }
	}

	/**
	 * Add a new synchronization function to be called after users join.
	 * @param f The synchronization function to add to the list to be called.
	 * @returns An ID that can be used to remove this sync function later.
	 */
	public addSyncFunc(f: { (): void }): number {
		this.syncFuncs.set(this.nextId, f);
		
		return this.nextId++;
	}

	/**
	 * Remove a sync function from the list.
	 * @param id The ID returned by a call to addSyncFunc()
	 */
	public removeSyncFunc(id: number) {
		if (this.syncFuncs.has(id)) {
			this.syncFuncs.delete(id);
		}
	}
}
