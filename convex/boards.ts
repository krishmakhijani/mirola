import { v } from 'convex/values'

import { query } from './_generated/server'
import { favorite } from './board'
import { getAllOrThrow } from 'convex-helpers/server/relationships'

export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('boards args ', args.orgId)
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Unauthorized')
    }

    if (args.favorites) {
      const favBoards = await ctx.db
        .query('userFavorites')
        .withIndex('by_user_org', (q) =>
          q.eq('userId', identity.subject).eq('orgId', args.orgId),
        )
        .order('desc')
        .collect()

      const ids = favBoards.map((b) => b.boardId)

      const boards = await getAllOrThrow(ctx.db, ids)

      return boards.map((b) => ({
        ...b,
        isFavorite: true,
      }))
    }

    const title = args.search
    let boards = []

    if (title) {
      boards = await ctx.db
        .query('boards')
        .withSearchIndex('search_title', (q) =>
          q.search('title', title).eq('orgId', args.orgId),
        )
        .collect()
    } else {
      boards = await ctx.db
        .query('boards')
        .withIndex('by_org', (q) => q.eq('orgId', args.orgId))
        .order('desc')
        .collect()
    }

    const boardsWithFavoriteRelation = boards.map((board) => {
      return ctx.db
        .query('userFavorites')
        .withIndex('by_user_board', (q) =>
          q.eq('userId', identity.subject).eq('boardId', board._id),
        )
        .unique()
        .then((fav) => {
          return {
            ...board,
            isFavorite: !!fav,
          }
        })
    })

    const boardsWithFavoriteBoolean = Promise.all(boardsWithFavoriteRelation)

    return boardsWithFavoriteBoolean
  },
})
