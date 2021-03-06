namespace WavesBot.Services
{
    using System;
    using System.Threading.Tasks;
    using ViewLib.Data;
    using ViewLib.Repositories;

    public class GuidService
    {
        private readonly IGuidRepository guidRepository;
        private readonly Func<DateTimeOffset> now;

        public GuidService(Func<DateTimeOffset> now,
            IGuidRepository guidRepository)
        {
            this.now = now;
            this.guidRepository = guidRepository;
        }

        public async Task<string> GenerateString(long chatId, string nickname,
            WavesData wavesData = null, TokenData tokenData = null)
        {
            var str = (chatId >> now().Second).ToString();

            var guid = Guid.NewGuid().ToString();

            var stringGuid = $"{guid.Substring(0, 10)}{str}";

            var stamp = new TelegramGuidStamp
            {
                Guid = stringGuid,
                Identifier = chatId,
                NickName = nickname,
                WavesData = wavesData,
                TokenData = tokenData
            };

            await guidRepository.CreateOrUpdateGuidAsync(stringGuid, stamp);
            return stringGuid;
        }

        public async Task DeleteGuid(string guid)
        {
            await guidRepository.DeleteGuidAsync(guid);
        }

        public async Task<bool> ValidateString(string guid)
        {
            var telegramGuidStamp = await guidRepository.ReadGuidAsync(guid);
            return telegramGuidStamp != null;
        }

        public async Task<DateTimeOffset> GetLifetime(string guid)
        {
            var telegramGuidStamp = await guidRepository.ReadGuidAsync(guid);
            return telegramGuidStamp.LifetimeToDelete;
        }

        public async Task<TelegramGuidStamp> GetGuidStamp(string guid)
        {
            return await guidRepository.ReadGuidAsync(guid);
        }
    }
}