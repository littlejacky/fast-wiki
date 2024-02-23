using FastWiki.Service.Application.ChatApplications.Queries;
using FastWiki.Service.Contracts.ChatApplication.Dto;
using Masa.BuildingBlocks.Data.Mapping;

namespace FastWiki.Service.Application.ChatApplications;

public class ChatApplicationQueryHandler(IChatApplicationRepository chatApplicationRepository,IMapper mapper)
{
    [EventHandler]
    public async Task ChatApplicationAsync(ChatApplicationQuery query)
    {
        var result = await chatApplicationRepository.GetListAsync(query.Page,query.PageSize);

        var total = await chatApplicationRepository.GetCountAsync();

        query.Result = new PaginatedListBase<ChatApplicationDto>()
        {
            Result = mapper.Map<List<ChatApplicationDto>>(result),
            Total = total
        };

    }
    
}