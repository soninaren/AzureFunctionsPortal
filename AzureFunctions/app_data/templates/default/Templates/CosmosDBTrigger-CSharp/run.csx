#r "Microsoft.Azure.Documents.Client"
using System;
using System.Collections.Generic;
using Microsoft.Azure.Documents;

public static void Run(IReadOnlyList<Document> input, TraceWriter log)
{
    log.Verbose("Documents modified " + input.Count);
    log.Verbose("First document Id " + input[0].Id);
}
